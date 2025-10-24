
const FeatureCard = ({icon,feature,description}:{icon:string,feature:string,description:string}) => {
  return (
    <div className="flex flex-col justify-center items-center text-center gap-4 border-1 border-light-grey px-4 py-7 rounded-sm ">
        <img src={icon} alt={feature} />
        <h4 className="text-primary-600">{feature}</h4>
        <p className="text-primary-600 ">{description}</p>
    </div>
  )
}

export default FeatureCard