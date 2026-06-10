'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

type Props = {
  srcs: string[]
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export default function RandomIllustration({ srcs, alt, width, height, className, priority }: Props) {
  const [src, setSrc] = useState(srcs[0])
  const picked = useRef(false)

  useEffect(() => {
    if (!picked.current) {
      picked.current = true
      setSrc(srcs[Math.floor(Math.random() * srcs.length)])
    }
  }, [srcs])

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}
