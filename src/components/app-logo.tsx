import * as React from "react"
import Image from "next/image";

export const AppLogo = (props: React.ComponentProps<typeof Image>) => (
    <Image 
      src="/images/logo.png" 
      alt="BPX Master Logo"
      width={150}
      height={40}
      priority
      {...props}
    />
)