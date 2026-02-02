
import { isDbConnected } from "../config/db";
import mockMongoDb from "../services/mongodb-mock";
import User from "../models/User.model";

class DatabaseFacade {
  private mockMode = false;

  constructor() {
    this.checkConnection();
  }

  private checkConnection() {
    this.mockMode = !isDbConnected();
  }

  async findUserByEmail(email: string) {
    this.checkConnection();
    
    if (this.mockMode) {
      const users = mockMongoDb.getAllUsers() as any[];
      return users.find(u => u.email === email) || null;
    }
    
    return await User.findOne({ email });
  }

  async findUserById(id: string) {
    this.checkConnection();
    
    if (this.mockMode) {
      const user = mockMongoDb.findUser(id) as any;
      if (user) {
        const { password_hash, ...rest } = user;
        return rest;
      }
      return null;
    }
    
    return await User.findById(id).select("-password_hash");
  }

  async createUser(data: any) {
    this.checkConnection();
    
    if (this.mockMode) {
      const id = `user_${Date.now()}`;
      return mockMongoDb.createUser(id, data);
    }
    
    return await User.create(data);
  }

  async updateUser(id: string, data: any) {
    this.checkConnection();
    
    if (this.mockMode) {
      const updated = mockMongoDb.updateUser(id, data);
      if (updated) {
        const { password_hash, ...rest } = updated;
        return rest;
      }
      return null;
    }
    
    const updated = await User.findByIdAndUpdate(id, data, { new: true });
    if (updated) {
      return updated.toObject ? updated.toObject() : updated;
    }
    return null;
  }

  async findUserByEmailVerificationToken(token: string) {
    this.checkConnection();
    
    if (this.mockMode) {
      const users = mockMongoDb.getAllUsers() as any[];
      return users.find(u => u.email_verification_token === token) || null;
    }
    
    return await User.findOne({ email_verification_token: token });
  }

  
  isReady(): boolean {
    return true;
  }

  getMode(): string {
    this.checkConnection();
    return this.mockMode ? "MOCK" : "MongoDB";
  }
}

export const db = new DatabaseFacade();
