interface BannerProps {
  value: string;
  legend: string;
  align: 'left' | 'center' | 'right';
  textColor: string;
  className: string;
}

const Banner = ({ value, legend, align, textColor, className }: BannerProps) => {
  const getAlignClasses = () => {
    switch (align) {
      case 'left':
        return 'text-left';
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className={`flex-1 flex rounded-3xl p-8 relative overflow-hidden ${className}`}>
      <div className={`relative z-10 ${getAlignClasses()}`}>
        <h3 className={`text-4xl font-bold ${textColor} mb-2`}>{value}</h3>
        <p className={`${textColor} text-lg`}>{legend}</p>
      </div>
    </div>
  );
};

export default Banner;
