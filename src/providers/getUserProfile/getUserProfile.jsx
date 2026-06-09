import { createContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Api } from "../../api/API";

export const UserProfileContext = createContext();

const clearStoredSession = () => {
  Cookies.remove("token");
  Cookies.remove("role");
  localStorage.removeItem("token");
  localStorage.removeItem("isApproved");
  delete axios.defaults.headers.common["Authorization"];
};

const normalizeProfileRole = (value = "") => {
  const normalized = String(value || "").toLowerCase();
  return normalized === "superseller" ? "supersaler" : normalized;
};

const resolveProfileFromResponse = (data = {}) => {
  const key = Object.keys(data).find((item) =>
    ["user", "consumer", "producer", "supersaler", "superseller", "wholesaler"].includes(item)
  );

  return key ? data[key] : null;
};

// eslint-disable-next-line react/prop-types
const GetUserProfile = ({ children }) => {
  const token = Cookies.get("token") || localStorage.getItem("token");
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [role, setRole] = useState(Cookies.get("role") || null);
  const apiRole = normalizeProfileRole(role);

  useEffect(() => {
    if (!token || !role) {
      if (!token) {
        clearStoredSession();
      }
      setUserProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    axios
      .get(`${Api}/api/v1/${apiRole}/profile`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const profileData = resolveProfileFromResponse(res.data);

        if (profileData) {
          setUserProfile(profileData);
        } else {
          clearStoredSession();
          setUserProfile(null);
          setProfileError("Unknown user type in profile response.");
        }
      })
      .catch((err) => {
        const status = err.response?.status;
        if ([401, 403, 404].includes(status)) {
          clearStoredSession();
        }
        setUserProfile(null);
        setProfileError(
          err.response?.data?.message || "প্রোফাইল লোড করা যায়নি"
        );
      })
      .finally(() => setProfileLoading(false));
  }, [apiRole, token, role]);

  const logout = async () => {
    try {
      await axios.post(
        `${Api}/api/v1/logout`,
        { userId: userProfile?._id || userProfile?.id },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      clearStoredSession();
      setUserProfile(null);
      setRole(null);
    }
  };

  return (
    <UserProfileContext.Provider
      value={{
        userProfile,
        profileLoading,
        profileError,
        refreshProfile: (nextProfile) => setUserProfile(nextProfile),
        setRole,
        logout,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export default GetUserProfile;
