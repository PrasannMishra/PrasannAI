declare module '@/components/loader/Loader.jsx' {
    import { FC } from 'react';

    interface LoaderProps {
        message?: string;
        size?: 'small' | 'medium' | 'large';
    }

    export const Loader: FC<LoaderProps>;
    export default Loader;
}