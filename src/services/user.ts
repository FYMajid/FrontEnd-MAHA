import api from "./api";
import type { AuthUser } from "./auth";

export interface CurrentUserResponse {
  message: string;
  user: AuthUser;
}

export const userService = {
  async getMe() {
    const response = await api.get<CurrentUserResponse>("/user/me");
    return response.data;
  },
};
