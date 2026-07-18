import React, { forwardRef } from'react';
import { cn } from'../../utils/cn';

const GlassInput = forwardRef(({ className, type ='text', icon: Icon, ...props }, ref) => {
 return (
 <div className="relative w-full">
 {Icon && (
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray">
 <Icon size={20} />
 </div>
 )}
 <input
 type={type}
 className={cn(
"w-full bg-input border border-border rounded-[12px] px-4 py-3 text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-[4px] focus:ring-primary/25 focus:border-primary transition-all",
 Icon &&"pl-11",
 className
 )}
 ref={ref}
 {...props}
 />
 </div>
 );
});

GlassInput.displayName ='GlassInput';

export default GlassInput;
