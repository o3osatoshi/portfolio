import React from "react";

import { Header } from "../Header/Header";
import "./page.css";

type User = {
  name: string;
};

export const Page: React.FC = () => {
  const [user, setUser] = React.useState<User>();

  return (
    <article>
      <Header
        onCreateAccount={() => setUser({ name: "Jane Doe" })}
        onLogin={() => setUser({ name: "Jane Doe" })}
        onLogout={() => setUser(undefined)}
        user={user}
      />

      <section className="storybook-page">
        <h2>Pages in Storybook</h2>
        <p>
          We recommend building UIs with a{" "}
          <a
            href="https://componentdriven.org"
            rel="noopener noreferrer"
            target="_blank"
          >
            <strong>component-driven</strong>
          </a>{" "}
          process starting with atomic components and ending with pages.
        </p>
        <p>
          Render pages with mock data. This makes it easy to build and review
          page states without needing to navigate to them in your app. Here are
          some handy patterns for managing page data in Storybook:
        </p>
        <ul>
          <li>
            Use a higher-level connected component. Storybook helps you compose
            such data from the "args" of child component stories
          </li>
          <li>
            Assemble data in the page component from your services. You can mock
            these services out using Storybook.
          </li>
        </ul>
        <p>
          Get a guided tutorial on component-driven development at{" "}
          <a
            href="https://storybook.js.org/tutorials/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Storybook tutorials
          </a>
          . Read more in the{" "}
          <a
            href="https://storybook.js.org/docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            docs
          </a>
          .
        </p>
        <div className="tip-wrapper">
          <span className="tip">Tip</span> Adjust the width of the canvas with
          the Viewports addon in the toolbar
        </div>
      </section>
    </article>
  );
};
