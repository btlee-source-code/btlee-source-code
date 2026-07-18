import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { View } from 'react-native';

/**
 * Renders its children with a full-bleed hairline divider between each one —
 * like <hr> in HTML. The default divider uses `-mx-5` to break out of a parent
 * with `px-5` padding so it spans edge to edge; pass `dividerClassName` to match
 * a different padding (e.g. `-mx-4`). Null/false children (conditional fields)
 * are dropped, so no empty dividers appear.
 */
export function DividedStack({
  children,
  dividerClassName = 'h-0.5 bg-muted-foreground/30 -mx-5',
}: {
  children: ReactNode;
  dividerClassName?: string;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <>
      {items.map((child, i) => (
        <Fragment key={i}>
          {child}
          {i < items.length - 1 && <View className={dividerClassName} />}
        </Fragment>
      ))}
    </>
  );
}
