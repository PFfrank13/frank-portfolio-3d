import { motion, useReducedMotion } from 'framer-motion';

/** Aparición única al entrar en pantalla. Úsalo con criterio: solo donde la lectura lo pide. */
export default function Reveal({ as = 'div', delay = 0, y = 18, className = '', children, ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  if (reduce) return <Tag className={className} {...rest}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
