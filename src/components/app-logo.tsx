import * as React from "react"

export const AppLogo = (props: React.ComponentProps<"img">) => (
    <img 
      src="/logo.png" 
      alt="BPX Master Logo"
      width={150}
      height={40}
      {...props}
    />
)
