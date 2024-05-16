import { AppInfo } from "../../config/appInfo.config";

export namespace Server {
  export const persistPhoneNumber = async (
    phoneNumber: string,
  ): Promise<Response> => {
    const formData = new URLSearchParams();
    formData.append("phoneNumber", phoneNumber);

    const response = await fetch(AppInfo.NOTIFY_ME_FORM_API_URL, {
      method: "POST",
      body: formData.toString(),
    });

    return response;
  };
}
