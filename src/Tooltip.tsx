import React, {
  createContext,
  createRef,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export function Tooltip(props: PropsWithChildren<unknown>) {
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
            title={child.props["data-tooltip-template"] ?? child.props.title}
            onMouseEnter={child.props.onMouseEnter}
            onMouseLeave={child.props.onMouseLeave}
            onMouseOver={child.props.onMouseOver}
          >
            {child}
          </TooltipTrigger>
        );
      }

      if (child.props?.children !== undefined) {
        return React.cloneElement(child, {
          ...child.props,
          children: ProcessTitles(child.props),
        });
      }
    });
  }

  return <>{ProcessTitles(props)}</>;
}

type TooltipTriggerContextProps =
  | {
      beginTooltipHide: () => void;
      stopTooltipHide: () => void;
    }
  | undefined;

const TooltipTriggerContext =
  createContext<TooltipTriggerContextProps>(undefined);

function useTooltipTriggerContext() {
  const tooltipTriggerContext = useContext(TooltipTriggerContext);

  if (!tooltipTriggerContext) {
    throw new Error(
      "TooltipTriggerContext.Provider is required in a parent component, and it must have a valid value."
    );
  }

  return tooltipTriggerContext;
}

function TooltipTrigger({
  children,
  title,
  onMouseEnter,
  onMouseLeave,
  onMouseOver,
}: {
  children:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactPortal;
  title: React.ReactNode | string;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onMouseOver?: (e: MouseEvent) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | undefined>();
  const hideTimer = useRef<number | undefined>();
  const childRef = createRef<HTMLElement>();

  function handleMouseOver(e: MouseEvent) {
    onMouseOver?.(e);

    if (showTooltip) {
      stopTooltipHide();
      return;
    }

    handleMouseEnter(e);
  }

  function handleMouseEnter(e: MouseEvent) {
    onMouseEnter?.(e);

    stopTooltipHide();
    const currentChild = childRef.current;

    if (!currentChild?.getBoundingClientRect) {
      return;
    }

    setTargetRect(currentChild.getBoundingClientRect());

    setShowTooltip(true);
  }

  const stopTooltipHide = () => {
    clearTimeout(hideTimer.current);
  };

  const beginTooltipHide = () => {
    stopTooltipHide();
    hideTimer.current = setTimeout(() => setShowTooltip(false), 250);
  };

  function handleMouseLeave(e: MouseEvent) {
    onMouseLeave?.(e);
    beginTooltipHide();
  }

  return (
    <TooltipTriggerContext.Provider
      value={{ beginTooltipHide, stopTooltipHide }}
    >
      {React.cloneElement(children, {
        ...children.props,
        title: null,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onMouseOver: showTooltip ? onMouseOver : handleMouseOver,
        ref: childRef,
        ["data-tooltip-template"]: null,
      })}
      {showTooltip
        ? createPortal(
            <TooltipBody targetRect={targetRect}>{title}</TooltipBody>,
            document.body
          )
        : null}
    </TooltipTriggerContext.Provider>
  );
}

type TooltipBodyProps = PropsWithChildren<{
  targetRect: DOMRect | undefined;
}>;

function TooltipBody({ targetRect, children }: TooltipBodyProps) {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const ref = createRef<HTMLDivElement>();
  const { beginTooltipHide, stopTooltipHide } = useTooltipTriggerContext();

  useEffect(() => {
    if (!targetRect || !ref.current) {
      return;
    }

    const newTop = Math.floor(targetRect.y + targetRect.height);
    setTop(newTop);

    const tooltipRect = ref.current.getBoundingClientRect();
    const targetMidpointX = targetRect.x + targetRect.width / 2;
    const newLeft = Math.max(0, targetMidpointX - tooltipRect.width / 2);
    setLeft(newLeft);

    setOpacity(1);
  }, [targetRect]);

  return (
    <div
      className="tooltip"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        opacity: opacity,
        transition: "opacity 50ms ease-in",
      }}
      onMouseEnter={() => stopTooltipHide()}
      onMouseLeave={() => beginTooltipHide()}
      ref={ref}
    >
      <div className="tooltip__arrow bottom"></div>
      <div className="tooltip__body">{children}</div>
    </div>
  );
}
