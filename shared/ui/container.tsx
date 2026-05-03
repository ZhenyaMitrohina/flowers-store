import React from "react";
import { cn } from "../lib/utils";

export const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
	return (
		<div className={cn("container mx-auto px-4 md:px-10 2xl:px-0", className)}>
			{children}
		</div>
	)
}