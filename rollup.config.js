import { defineConfig } from 'rollup';
import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.cjs.js',
      format: 'cjs',
    },
    {
      file: 'lib/index.mjs.js',
      format: 'es',
    },
    {
      file: `lib/index.umd.js`,
      format: 'umd',
      // 注意如果是umd格式的bundle的话name属性是必须的，这时可以在script标签引入后window下会挂载该属性的变量来使用你的类库方法
      name: 'index',
    },
  ],
  plugins: [
    babel(),
    typescript({
      sourceMap: false,
    }),
    resolve(),
  ],
});
