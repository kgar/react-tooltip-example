import React, { MouseEventHandler, PropsWithChildren, useState } from 'react';

function App() {
  return (
    <div className="App">
      <Tooltip>
        <h1>Hello</h1>
        <p
          title="This is the way"
          data-tooltip-template={<h1>THIS IS THE WAY</h1>}
          style={{
            background: 'linear-gradient(#e66465, #9198e5)',
          }}
        >
          This is a paragraph with a title and a tooltip template. It also has its own styles. <em>Those styles had better be preserved! 👀</em>
        </p>
        <div>
          This is a cool div with{' '}
          <div data-tooltip-template={<span>Surprise, surprise ☺</span>}>
            nested{' '}
            <div
              title="You should still see this as an ordinary tooltip, because we don't do nested tooltips in my lib 😡"
              data-tooltip-template={<h1>Will you be able to see this?</h1>}
            >
              divs
            </div>
          </div>
          . What a surprise!
        </div>
        <div title="The most basic example">
          I'm, like, the happy path example.
        </div>
      </Tooltip>
    </div>
  );
}

function Tooltip(props: PropsWithChildren<unknown>) {
  function ProcessTitles(
    props: PropsWithChildren<unknown>
  ):
    | string
    | number
    | boolean
    | {}
    | null
    | undefined
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactPortal {
    const propChildren = props.children;
    return React.Children.map(propChildren, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      if (child.props?.title !== undefined) {
        return (
          <TooltipTrigger
            title={child.props['data-tooltip-template'] ?? child.props.title}
          >
            {child}
          </TooltipTrigger>
        );
      }

      if (child.props?.children !== undefined) {
        return ProcessTitles(child.props);
      }
    });
  }

  return <>{ProcessTitles(props)}</>;
}

function TooltipTrigger({
  children,
  title,
  onMouseEnter,
  onMouseLeave,
}: {
  children:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactPortal;
  title: React.ReactNode | string;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
}) {
  function tooltipTriggerMouseEnter(e: MouseEvent) {
    onMouseEnter?.(e);
    console.log('Mouse enter', title);
  }

  function tooltipTriggerMouseLeave(e: MouseEvent) {
    onMouseLeave?.(e);
    console.log('Mouse leave', title);
  }

  return React.cloneElement(children, {
    ...children.props,
    title: null,
    onMouseEnter: tooltipTriggerMouseEnter,
    onMouseLeave: tooltipTriggerMouseLeave,
    ['data-tooltip-template']: null,
  });
}

export default App;
