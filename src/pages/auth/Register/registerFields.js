export const REGISTER_ROLES = ["producer", "supersaler", "wholesaler", "consumer"];

export const ROLE_LABELS = {
  producer: "উৎপাদক",
  supersaler: "সুপার সেলার",
  wholesaler: "পাইকার",
  consumer: "ক্রেতা",
};

export const REGISTER_FIELD_NAMES = [
  "role",
  "name",
  "phone",
  "otp",
  "email",
  "nid",
  "tradelicense",
  "division",
  "district",
  "thana",
  "address",
  "password",
  "confirmPassword",
];

export const INITIAL_REGISTER_FORM = {
  name: "",
  phone: "",
  otp: "2468",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
  nid: "",
  tradelicense: "",
  division: "",
  district: "",
  thana: "",
};

export const COMMON_FIELDS = [
  {
    name: "name",
    label: "নাম",
    placeholder: "আপনার নাম লিখুন",
    type: "text",
    required: true,
  },
];

export const CONSUMER_FIELDS = [
  {
    name: "phone",
    label: "মোবাইল নম্বর",
    placeholder: "আপনার মোবাইল নম্বর লিখুন",
    type: "text",
    required: true,
  },
  {
    name: "otp",
    placeholder: "ওটিপি লিখুন",
    type: "text",
  },
];

export const BUSINESS_FIELDS = [
  {
    name: "email",
    label: "ইমেইল",
    placeholder: "আপনার ইমেইল লিখুন",
    type: "email",
    required: true,
  },
  {
    name: "phone",
    label: "মোবাইল নম্বর",
    placeholder: "আপনার মোবাইল নম্বর লিখুন",
    type: "text",
    required: true,
  },
  {
    name: "nid",
    label: "এনআইডি",
    placeholder: "আপনার এনআইডি নম্বর লিখুন",
    type: "text",
    required: true,
  },
  {
    name: "tradelicense",
    label: "ট্রেড লাইসেন্স",
    placeholder: "আপনার ট্রেড লাইসেন্স নম্বর লিখুন",
    type: "text",
    required: true,
    hiddenForRoles: ["wholesaler"],
  },
  {
    name: "division",
    label: "বিভাগ",
    placeholder: "আপনার বিভাগ লিখুন",
    type: "text",
    required: true,
  },
  {
    name: "district",
    label: "জেলা",
    placeholder: "আপনার জেলা লিখুন",
    type: "text",
    required: true,
  },
  {
    name: "thana",
    label: "থানা",
    placeholder: "আপনার থানা লিখুন",
    type: "text",
    required: true,
  },
  {
    name: "address",
    label: "ঠিকানা",
    placeholder: "আপনার ঠিকানা লিখুন",
    type: "textarea",
    required: true,
  },
];

export const PASSWORD_FIELDS = [
  {
    name: "password",
    label: "পাসওয়ার্ড",
    placeholder: "আপনার পাসওয়ার্ড লিখুন",
    required: true,
  },
  {
    name: "confirmPassword",
    label: "পাসওয়ার্ড নিশ্চিত করুন",
    placeholder: "আবার পাসওয়ার্ড লিখুন",
    required: true,
  },
];
