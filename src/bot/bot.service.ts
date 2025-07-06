import { Injectable } from "@nestjs/common";
import { Bot } from "./models/bot.model";
import { Op } from "sequelize";

@Injectable()
export class BotService {

  async getUserById(userId: string) {
    return await Bot.findOne({ where: { user_id: userId } });
  }

  async getAllUsers() {
    return await Bot.findAll();
  }

  async getSahiyUsers() {
    return await Bot.findAll({ where: { role: "sahiy" } });
  }

  async getSabrliUsers() {
    return await Bot.findAll({ where: { role: "sabrli" } });
  }

  async updateUserName(userId: string, newName: string) {
    const user = await Bot.findOne({ where: { user_id: userId } });
    if (user) {
      user.name = newName;
      return await user.save();
    }
    return null;
  }

  async updateUserPhone(userId: string, newPhone: string) {
    const user = await Bot.findOne({ where: { user_id: userId } });
    if (user) {
      user.phone_number = newPhone;
      return await user.save();
    }
    return null;
  }

  async updateUserRole(userId: string, newRole: string) {
    const user = await Bot.findOne({ where: { user_id: userId } });
    if (user) {
      user.role = newRole;
      return await user.save();
    }
    return null;
  }

  async updateUserState(userId: string, newState: string) {
    const user = await Bot.findOne({ where: { user_id: userId } });
    if (user) {
      user.last_state = newState;
      return await user.save();
    }
    return null;
  }

  async createUser(userData: {
    user_id: string;
    first_name?: string;
    last_name?: string;
    last_state: string;
  }) {
    return await Bot.create(userData);
  }

  async deleteUser(userId: string) {
    return await Bot.destroy({ where: { user_id: userId } });
  }

  
  async getTotalUsersCount() {
    return await Bot.count();
  }

  async getSahiyUsersCount() {
    return await Bot.count({ where: { role: "sahiy" } });
  }

  async getSabrliUsersCount() {
    return await Bot.count({ where: { role: "sabrli" } });
  }

  async getTodayRegistrations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await Bot.count({
      where: {
        createdAt: {
          [Op.gte]: today,
        },
      },
    });
  }

  async isUserExists(userId: string) {
    const user = await Bot.findOne({ where: { user_id: userId } });
    return !!user;
  }

  async getCompletedRegistrations() {
    return await Bot.findAll({
      where: {
        last_state: "completed",
      },
    });
  }


  async getIncompleteRegistrations() {
    return await Bot.findAll({
      where: {
        last_state: {
          [Op.ne]: "completed",
        },
      },
    });
  }
}
