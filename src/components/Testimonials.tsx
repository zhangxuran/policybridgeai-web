import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: '张明',
      title: '采购总监',
      company: '深圳某进出口贸易公司',
      avatar: '/assets/testimonial-avatar-1.jpg',
      rating: 5,
      content:
        '使用AI审核系统后，我们的合同审核效率提升了10倍。之前每份合同都要找律师看，不仅贵还慢。现在3分钟就能发现潜在风险，帮我们避免了好几次重大损失。特别是Incoterm条款的识别非常准确！',
      highlight: '帮我们避免了好几次重大损失',
    },
    {
      name: '李华',
      title: '总经理',
      company: '上海某外贸公司',
      avatar: '/assets/testimonial-avatar-2.jpg',
      rating: 5,
      content:
        '作为中小企业，我们每年要签几百份合同，如果每份都找律师审核，成本根本承受不起。这个AI系统真的帮了大忙，不仅便宜，而且准确率很高。现在我们的法务成本降低了90%，业务流程也更快了。',
      highlight: '法务成本降低了90%',
    },
    {
      name: '王强',
      title: '供应链经理',
      company: '广州某跨境电商公司',
      avatar: '/assets/testimonial-avatar-1_variant_1.jpg',
      rating: 5,
      content:
        '平台合同审核功能太实用了！我们在亚马逊、阿里巴巴等多个平台开店，每个平台的合同都不一样。AI能快速识别出不公平条款和潜在风险，让我们在签约前就能做好准备。强烈推荐给同行！',
      highlight: '快速识别不公平条款',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            客户
            <span className="text-blue-600"> 真实评价</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            已为500+家贸易企业提供服务，帮助他们规避合同风险
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
            >
              <CardContent className="p-6 space-y-4">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Quote className="w-16 h-16 text-blue-600" />
                </div>

                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed relative z-10">
                  "{testimonial.content}"
                </p>

                {/* Highlight */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                  <p className="text-sm font-semibold text-blue-900">💡 {testimonial.highlight}</p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}</div>
                    <div className="text-xs text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { number: '500+', label: '服务企业' },
            { number: '10,000+', label: '审核合同' },
            { number: '98%', label: '客户满意度' },
            { number: '90%', label: '成本节省' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}