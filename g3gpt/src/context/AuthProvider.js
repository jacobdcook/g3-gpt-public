// g3gpt/src/context/AuthProvider.js

import React, { createContext } from 'react';
import { pca } from '../pages/loginUI/authConfig';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    return (
        <AuthContext.Provider value={{ pca }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;