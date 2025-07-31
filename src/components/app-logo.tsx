import * as React from "react"
import Image from "next/image"

export const AppLogo = (props: Omit<React.ComponentProps<typeof Image>, "src" | "alt" | "width" | "height">) => (
    <Image
      src="/images/logo.png"
      alt="BPX Master Logo"
      width={200}
      height={80}
      {...props}
      unoptimized
    />
)
