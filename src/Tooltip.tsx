import React, {
  createRef,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

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
            title={child.props['data-tooltip-template'] ?? child.props.title}
            onMouseEnter={child.props.onMouseEnter}
            onMouseLeave={child.props.onMouseLeave}
            onMouseOver={child.props.onMouseOver}
          >
            {child}
          </TooltipTrigger>
        );
      }

      if (child.props?.children !== undefined) {
        // This is where it's happening...
        return React.cloneElement(child, {
          ...child.props,
          children: ProcessTitles(child.props),
        });
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
  const childRef = createRef<HTMLElement>();
  const [targetRect, setTargetRect] = useState<DOMRect | undefined>();

  function tooltipTriggerMouseOver(e: MouseEvent) {
    if (showTooltip) {
      return;
    }

    tooltipTriggerMouseEnter(e);
  }

  function tooltipTriggerMouseEnter(e: MouseEvent) {
    onMouseEnter?.(e);

    const currentChild = childRef.current;

    if (!currentChild?.getBoundingClientRect) {
      return;
    }

    setTargetRect(currentChild.getBoundingClientRect());

    setShowTooltip(true);
  }

  function tooltipTriggerMouseLeave(e: MouseEvent) {
    onMouseLeave?.(e);
    setShowTooltip(false);
  }

  return (
    <>
      {React.cloneElement(children, {
        ...children.props,
        title: null,
        onMouseEnter: tooltipTriggerMouseEnter,
        onMouseLeave: tooltipTriggerMouseLeave,
        onMouseOver: showTooltip ? onMouseOver : tooltipTriggerMouseOver,
        ref: childRef,
        ['data-tooltip-template']: null,
      })}
      {showTooltip
        ? createPortal(
            <TooltipBody targetRect={targetRect}>{title}</TooltipBody>,
            document.body
          )
        : null}
    </>
  );
}

function TooltipBody({
  targetRect,
  children,
}: PropsWithChildren<{ targetRect: DOMRect | undefined }>) {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const ref = createRef<HTMLDivElement>();

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
  }, [targetRect]);

  return (
    <div
      className="tooltip overlay"
      style={{
        top: `${top}px`,
        left: `${left}px`,
      }}
      ref={ref}
    >
      <div className="tooltip__arrow bottom"></div>
      <div className="tooltip__body">{children}</div>
    </div>
  );
}
