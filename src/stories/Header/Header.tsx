import React from "react";

import { Button } from "@/components/ui/button/button";
import "./header.css";

type User = {
  name: string;
};

export interface HeaderProps {
  user?: User | undefined;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
}

export const Header = ({
  user,
  onLogin,
  onLogout,
  onCreateAccount,
}: HeaderProps) => (
  <header>
    <div className="storybook-header">
      <div>
        <h1>Acme</h1>
      </div>
      <div>
        {user ? (
          <>
            <span className="welcome">
              Welcome, <b>{user.name}</b>!
            </span>
            <Button onClick={onLogout} size="sm">
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onLogin} size="sm">
              Log in
            </Button>
            <Button onClick={onCreateAccount} size="sm">
              Sign up
            </Button>
          </>
        )}
      </div>
    </div>
  </header>
);
