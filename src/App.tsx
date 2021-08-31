import React from "react";
import { Tooltip } from "./Tooltip";
import "./tooltip.default.css";

function App() {
  return (
    <div className="App">
      <Tooltip>
        <h1>Hello</h1>
        <p
          title="This is the way"
          data-tooltip-template={<h1>THIS IS THE WAY</h1>}
          style={{
            background: "linear-gradient(#e66465, #9198e5)",
          }}
        >
          This is a paragraph with a title and a tooltip template. It also has
          its own styles. <em>Those styles had better be preserved! 👀</em>
        </p>
        <div>
          This is a cool div with{" "}
          <div data-tooltip-template={<span>Surprise, surprise ☺</span>}>
            nested{" "}
            <span
              title="You should still see this as an ordinary tooltip, because we don't do nested tooltips in my lib 😡"
              data-tooltip-template={<h1>Will you be able to see this?</h1>}
            >
              HTML
            </span>
          </div>
          . What a surprise!
        </div>
        <div>
          <span title="The most basic example">
            I'm, like, the happy path example.
          </span>
        </div>
      </Tooltip>
    </div>
  );
}

export default App;
