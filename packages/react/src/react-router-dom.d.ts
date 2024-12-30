import "react-router-dom";

declare module "react-router-dom" {
  export interface LinkProps {
    databehavior?: string; // Add your custom attribute here
  }
}
