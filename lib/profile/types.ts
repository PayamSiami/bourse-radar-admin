export interface ProfileFormData {
  displayName: string;
  email: string;
  avatarUrl: string;
  phone: string;
  country: string;
  city: string;
}

export const EMPTY_FORM: ProfileFormData = {
  displayName: "",
  email: "",
  avatarUrl: "",
  phone: "",
  country: "",
  city: "",
};
