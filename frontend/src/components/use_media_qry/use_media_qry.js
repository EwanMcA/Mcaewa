import { useMediaQuery } from "react-responsive";
import breakpoints from "./responsive.scss";

export const DEVICES = {
  XS: 0,
  MOBILE: 1,
  TABLET: 2,
  DESKTOP: 3,
  LARGE_DESKTOP: 4,
};

export const useBreakpoint = () => {
  const largeDesktop = useMediaQuery({
    query: `(min-width: ${breakpoints.largeDesktopBreakpoint})`,
  }) && DEVICES.LARGE_DESKTOP;
  const desktop = useMediaQuery({
    query: `(min-width: ${breakpoints.desktopBreakpoint})`,
  }) && DEVICES.DESKTOP;
  const tablet = useMediaQuery({
    query: `(min-width: ${breakpoints.tabletBreakpoint})`,
  }) && DEVICES.TABLET;
  const mobile = useMediaQuery({
    query: `(min-width: ${breakpoints.mobileBreakpoint})`,
  }) && DEVICES.MOBILE;

  return largeDesktop || desktop || tablet || mobile || "xs";
};

export const isDesktop = () => useBreakpoint() >= DEVICES.DESKTOP;

export const useMediaQry = width =>
  useMediaQuery({query: `(min-width: ${breakpoints[`${width}Breakpoint`]})`});
