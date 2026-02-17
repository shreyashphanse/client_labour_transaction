import { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser && parsedUser.role) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          console.warn("Invalid user object. Clearing storage.");
          localStorage.clear();
        }
      } catch (err) {
        console.warn("Corrupted storage. Clearing.");
        console.error(err);
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  const login = (data) => {
    const userData = {
      _id: data._id,
      name: data.name,
      role: data.role,
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(data.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
