import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { View, type TextInput } from "react-native";

/** Presentation-only bridge from submit validation to the rendered field. */
export const CheckoutValidationFocus = createContext<{
  target?: string;
  attempt: number;
  reveal: (view: View, input?: TextInput | null) => void;
} | null>(null);

/** Also reveals non-text controls, such as category choices and consent. */
export function ValidationTarget({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const context = useContext(CheckoutValidationFocus);
  const ref = useRef<View>(null);
  useEffect(() => {
    if (context?.attempt && context.target === id && ref.current) {
      context.reveal(ref.current);
    }
  }, [context, id]);
  return (
    <View ref={ref} collapsable={false}>
      {children}
    </View>
  );
}
