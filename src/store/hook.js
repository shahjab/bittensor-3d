import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
export const useUtil = () => useAppSelector(state => state.util);