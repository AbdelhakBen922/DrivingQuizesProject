import {Loader2} from "lucide-react";

const Loading = ({className} : {className?: string}) => {
  return (
   <div className={`size-full bg-primary-25 ${className}`}>
     <Loader2 className="animate-spin text-primary-800" size={64} />
   </div>
  )
}

export default Loading