import "react-router-dom";

declare module "react-router-dom" {
  export interface LinkProps {
    dataBehavior?: string; // Add your custom attribute here
  }
}
