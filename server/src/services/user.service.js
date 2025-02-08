import bcrypt from 'bcryptjs';
import { getDB } from '../config/db.js';

export class UserService {
  static async createUser(email, password, name = null, authProvider = 'local', googleId = null) {
    const db = await getDB();

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password only if provided (for local auth)
    let hashedPassword = null;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Insert user
    const result = await db.query(
      `INSERT INTO users (email, password, name, auth_provider, google_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [email, hashedPassword, name, authProvider, googleId]
    );

    return { id: result.rows[0].id, email, name, authProvider };
  }

  static async findUserByEmail(email) {
    const db = await getDB();
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findUserById(id) {
    const db = await getDB();
    const result = await db.query(
      `SELECT id, email, name, nick_name, gender, country, language, time_zone, 
              avatar_url, google_id, auth_provider, created_at 
       FROM users WHERE id = $1`, 
      [id]
    );
    return result.rows[0] || null;
  }

  static async findUserByGoogleId(googleId) {
    const db = await getDB();
    const result = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    return result.rows[0] || null;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    if (!hashedPassword) return false;
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateUser(id, updates) {
    const db = await getDB();
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Profile fields
    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.nickName !== undefined) {
      fields.push(`nick_name = $${paramIndex++}`);
      values.push(updates.nickName);
    }

    if (updates.gender !== undefined) {
      fields.push(`gender = $${paramIndex++}`);
      values.push(updates.gender);
    }

    if (updates.country !== undefined) {
      fields.push(`country = $${paramIndex++}`);
      values.push(updates.country);
    }

    if (updates.language !== undefined) {
      fields.push(`language = $${paramIndex++}`);
      values.push(updates.language);
    }

    if (updates.timeZone !== undefined) {
      fields.push(`time_zone = $${paramIndex++}`);
      values.push(updates.timeZone);
    }

    if (updates.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${paramIndex++}`);
      values.push(updates.avatarUrl);
    }

    if (updates.googleId !== undefined) {
      fields.push(`google_id = $${paramIndex++}`);
      values.push(updates.googleId);
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);

    if (!result.rows[0]) return null;

    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].name,
      nickName: result.rows[0].nick_name,
      gender: result.rows[0].gender,
      country: result.rows[0].country,
      language: result.rows[0].language,
      timeZone: result.rows[0].time_zone,
      avatarUrl: result.rows[0].avatar_url,
      authProvider: result.rows[0].auth_provider,
      createdAt: result.rows[0].created_at
    };
  }

  static async updatePassword(id, currentPassword, newPassword) {
    const db = await getDB();

    // Get user to verify current password
    const userResult = await db.query('SELECT password, auth_provider FROM users WHERE id = $1', [id]);
    const user = userResult.rows[0];

    if (!user) {
      throw new Error('User not found');
    }

    // If user has a password set, verify current password
    if (user.password) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );

    return true;
  }

  static async setPassword(id, newPassword) {
    const db = await getDB();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );

    return true;
  }

  static async deleteUser(id) {
    const db = await getDB();
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  static async findOrCreateGoogleUser(profile) {
    const db = await getDB();

    // Check if user exists with this Google ID
    let user = await this.findUserByGoogleId(profile.googleId);
    if (user) {
      return user;
    }

    // Check if user exists with this email
    user = await this.findUserByEmail(profile.email);
    if (user) {
      // Link Google account to existing user
      await db.query(
        'UPDATE users SET google_id = $1, auth_provider = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [profile.googleId, 'google', user.id]
      );
      return await this.findUserById(user.id);
    }

    // Create new user with Google account
    const result = await db.query(
      `INSERT INTO users (email, name, avatar_url, google_id, auth_provider) 
       VALUES ($1, $2, $3, $4, 'google') RETURNING id`,
      [profile.email, profile.name, profile.avatarUrl, profile.googleId]
    );

    return await this.findUserById(result.rows[0].id);
  }

  static formatUserResponse(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      nickName: user.nick_name,
      gender: user.gender,
      country: user.country,
      language: user.language,
      timeZone: user.time_zone,
      avatarUrl: user.avatar_url,
      authProvider: user.auth_provider,
      createdAt: user.created_at
    };
  }
}
