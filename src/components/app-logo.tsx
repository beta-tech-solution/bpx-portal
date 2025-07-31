import * as React from "react"
import Image from "next/image";

export const AppLogo = (props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) => (
    <Image 
      src="/images/logo.png" 
      alt="BPX Master Logo"
      width={150}
      height={40}
      priority
      {...props}
    />
)
