import User from "../models/userModel.js";

class UserController {
  static mapUser(user) {
    const { password, ...safe } = user.dataValues || user;

    return safe;
  }

  static mapPublicUser(user) {
    const { id, email, name, role, permissions } = UserController.mapUser(user);

    return { id, email, name, role, permissions };
  }

  static async getAll() {
    return (await User.getAllUsers()).map((u) => UserController.mapUser(u));
  }

  static async create(email, password, name) {
    if (password.length < 6) {
      throw new Error("The password must contain at least 6 characters");
    }

    const user = await User.createUser(email, password, name);
    return UserController.mapUser(user);
  }

  static async getById(id) {
    const user = await User.getUserById(id);

    return UserController.mapUser(user);
  }

  static async update(id, email, password, name) {
    if (password.length < 6) {
      throw new Error("Password must contain at least 6 characters");
    }

    if (email.length < 5 || !email.includes("@")) {
      throw new Error(
        'Email must contain at least 5 characters and include an "@"',
      );
    }

    const user = await User.updateUser(id, email, password, name);

    return UserController.mapUser(user);
  }

  static async delete(id) {
    return await User.deleteUser(id);
  }
}

export default UserController;
