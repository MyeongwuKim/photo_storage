'use client';
import React, {
   useEffect,
   useRef,
   useState,
   createContext,
   useReducer,
   useContext,
   useCallback,
   useMemo,
} from 'react';
import { Carousel } from 'flowbite-react';
import {
   ArrowLeftIcon,
   ArrowRightIcon,
   CheckIcon,
} from '@heroicons/react/24/solid';
import FirstPage from './page/firstPage';
import SecondPage from './page/secondPage';
import { carouselTheme } from '@/hooks/useFlowTheme';
import { calcSize, getImage, timeStamp } from '@/hooks/useUtil';
import { usePathname } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import getQueryClient from '@/hooks/useQueryClient';
import { useUI } from '../../uiProvider';

const slideBtnStyle = `w-16 h-10 absolute top-3 px-4 py-2.5
              text-sm font-medium text-gray-900 focus:outline-none
             bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700
             focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800
             dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700`;

let parentRightBtn: HTMLElement;

interface FileProps extends FileType {
   origin: any;
   originWidth: number;
   originHeight: number;
}

type InfoType = {
   tag: string[];
   comment: string;
   date: Date | null;
   mapData: MapDataType;
   score: number;
   mode: 'create' | 'edit';
};

type State = {
   fileItem: FileProps[];
   info: InfoType;
};

type Action =
   | { type: 'CHANGE_MODE' }
   | { type: 'ADD_FILES'; payload: FileProps }
   | { type: 'MOVE_FILE_ITEM'; payload: { from: number; to: number } }
   | { type: 'REMOVE_FILE_ITEM'; payload: number }
   | { type: 'CLEAR_FILE_ITEM' }
   | { type: 'SET_INFO'; payload: Partial<InfoType> }
   | { type: 'CLEAR_INFO' };

const initialState: State = {
   fileItem: [],
   info: {
      tag: [],
      comment: '',
      date: new Date(),
      mapData: { location: { lat: 0, lng: 0 }, placeAddress: '' },
      score: 5,
      mode: 'create',
   },
};

function reducer(state: State, action: Action): State {
   switch (action.type) {
      case 'ADD_FILES':
         return {
            ...state,
            fileItem: [...state.fileItem, action.payload],
         };
      case 'MOVE_FILE_ITEM': {
         const { from, to } = action.payload;
         const newFileItem = [...state.fileItem];
         const [movedItem] = newFileItem.splice(from, 1);
         newFileItem.splice(to, 0, movedItem);
         return { ...state, fileItem: newFileItem };
      }
      case 'REMOVE_FILE_ITEM': {
         const index = action.payload;
         return {
            ...state,
            fileItem: state.fileItem.filter((_, i) => i !== index),
         };
      }
      case 'CLEAR_FILE_ITEM':
         return {
            ...state,
            fileItem: [],
         };
      case 'SET_INFO':
         return {
            ...state,
            info: { ...state.info, ...action.payload },
         };
      case 'CLEAR_INFO':
         return {
            ...state,
            info: initialState.info,
         };
      default:
         return state;
   }
}

type ContextType = {
   state: State;
   dispatch: React.Dispatch<Action>;
};

const UploadModalContext = createContext<ContextType | undefined>(undefined);

const UploadModal = ({
   onClose,
   postId,
}: {
   onClose: (result?: any) => void;
   postId: string | null | undefined;
}) => {
   const queryClient = getQueryClient();
   const pathname = usePathname();
   const { openToast, openModal, activeLoading } = useUI();
   const [state, dispatch] = useReducer(reducer, initialState);
   const postData = useMemo(() => {
      if (postId)
         return (
            queryClient.getQueriesData({
               queryKey: [postId],
            })[0][1] as { ok: boolean; postData: PostType }
         ).postData;
   }, [postId]);
   //수정시 파일정보 load
   useEffect(() => {
      if (!postData) return;

      // 파일 세팅
      const contHeight =
         document.getElementById('firstpageContainer')!.offsetHeight;
      const contWidth =
         document.getElementById('firstpageContainer')!.offsetWidth;

      dispatch({ type: 'CLEAR_FILE_ITEM' });
      postData.files?.forEach((file) => {
         const { height, width } = calcSize(
            file.height,
            file.width,
            contWidth,
            contHeight
         );

         dispatch({
            type: 'ADD_FILES',
            payload: {
               fileId: file.fileId,
               origin: null,
               type: file.type,
               url: getImage('public', file.fileId),
               height,
               width,
               originHeight: file.height,
               originWidth: file.width,
               thumbnail: file.thumbnail,
            },
         });
      });

      // info 세팅
      dispatch({
         type: 'SET_INFO',
         payload: {
            tag: postData.tags ? postData.tags.map((tag) => tag.body) : [],
            comment: postData.comment ?? '',
            date: postData.shootingDate
               ? new Date(postData.shootingDate)
               : new Date(),
            mapData: {
               location: postData.map
                  ? { lat: postData.map.lat, lng: postData.map.lng }
                  : { lat: 0, lng: 0 },
               placeAddress: postData.map?.placeAddress ?? '',
            },
            score: postData.score ?? 5,
            mode: 'edit',
         },
      });
   }, [postData]);

   const createPost = useMutation({
      mutationFn: async ({
         files,
         info,
      }: {
         files: FileType[];
         info: InfoType;
      }) =>
         await fetch('/api/post', {
            method: 'post',
            body: JSON.stringify({ files, info }),
         }),
      onSuccess: async (data) => {
         activeLoading(false);
         const result = await data.json();
         if (result.ok) {
            parentRightBtn?.click();
            const key =
               pathname.replace('/', '').length <= 0 ? 'post' : pathname;
            await queryClient.refetchQueries({
               queryKey: ['tab'],
            });
         } else {
            openToast(true, result.error, 1.5);
         }
      },
   });

   const updatePost = useMutation<
      { data: PostType; ok: boolean },
      Error,
      { files: FileType[]; info: InfoType }
   >({
      mutationFn: async ({
         files,
         info,
      }: {
         files: FileType[];
         info: InfoType;
      }) => {
         const res = await fetch(`/api/post/${postId?.replace('post_', '')}`, {
            method: 'PATCH',
            body: JSON.stringify({ files, info }),
         });

         if (!res.ok) throw new Error('게시물 수정중 오류가 발생했습니다.');
         const jsonData = await res.json();

         return jsonData;
      },
      onSuccess: async (result) => {
         activeLoading(false);
         if (result.ok) {
            parentRightBtn?.click();
            queryClient.invalidateQueries({ queryKey: [postId] });

            // await queryClient.refetchQueries({
            //   queryKey: ["tab"],
            // });
         }
      },
      onError: (error) => {
         activeLoading(false);
         openToast(true, error.message, 1.5);
      },
   });

   const [flowNumber, setFlowNumber] = useState<number>(0);
   const [title, setTitle] = useState<string>('');
   const videoEleRef = useRef<{ [key: string]: HTMLVideoElement }>({});

   useEffect(() => {
      parentRightBtn = document.getElementById('rightArrow')
         ?.parentElement as HTMLElement;
   }, []);
   useEffect(() => {
      switch (flowNumber) {
         case 0:
            setTitle(
               state.fileItem.length <= 0 ? '파일 업로드' : '파일 미리보기'
            );
            break;
         case 1:
            setTitle('추가 작성');
            break;
         case 2:
            setTitle('');
            break;
      }
   }, [state.fileItem, flowNumber]);
   //비디오의 용량 길이 제한을 둘것인가?
   const uploadFile = async (file: any, type: string) => {
      let result = null;
      try {
         const resData = await (
            await fetch(`/api/upload/${type}`, { method: 'POST' })
         ).json();
         const form = new FormData();
         const filename = file.name.split('.');
         form.append(
            'file',
            file,
            `${process.env.NODE_ENV}_PhotoStorage_${type}_${
               filename[0]
            }_${timeStamp()}`
         );
         if (type == 'image') {
            const {
               result: { id },
            } = await (
               await fetch(resData.uploadURL, {
                  method: 'POST',
                  body: form,
               })
            ).json();
            result = id;
         } else {
            await fetch(resData.uploadURL, {
               method: 'POST',
               body: form,
            });
            result = resData.uid;
         }
      } catch {
         result = null;
      }
      return result;
   };

   const savePost = async () => {
      //valid
      const { isOk, msg } = validateInfo();
      if (!isOk) {
         openToast(true, msg, 1.5);
         return;
      }
      activeLoading(true);
      const results = [];

      const videoSamples = [
         'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      ];

      function getRandom<T>(arr: T[]): T {
         return arr[Math.floor(Math.random() * arr.length)];
      }
      let i = 0;
      for (const file of state.fileItem) {
         if (file.originWidth && file.originHeight) {
            file.width = file.originWidth;
            file.height = file.originHeight;
         }

         if (!file.origin) {
            results.push(file);
            continue;
         }

         activeLoading(true, `Upload ${file.type}..`);
         let fileId = null;
         if (process.env.NEXT_PUBLIC_DEMO) {
            if (file.type === 'image') {
               const width = 1200;
               const height = 800;
               // i를 seed로 → 항상 같은 결과 (데모 일관성 유지)
               fileId = `https://picsum.photos/seed/demo-${i}/${width}/${height}`;
               i++;
            } else {
               // video 샘플 중 랜덤 선택
               fileId = getRandom(videoSamples);
            }
         } else {
            fileId = await uploadFile(file.origin, file.type);
         }

         delete file.origin;

         if (fileId == null) {
            openToast(true, '업로드중 오류가 발생했습니다.', 1.5);
         } else {
            file.fileId = fileId;
            results.push(file);
         }
      }

      const { mutate } = postId ? updatePost : createPost;

      await mutate({
         files: results,
         info: state.info,
      });
   };

   const exitEvt = async () => {
      if (state.fileItem.length <= 0 || flowNumber == 2) onClose();
      else {
         const msg =
            state.info.mode == 'create'
               ? '게시물 작성을 취소하시겠습니까?'
               : '게시물 수정을 취소하시겠습니까?';
         const title = state.info.mode == 'create' ? '작성 취소' : '수정 취소';
         const result = await openModal('ALERT', {
            btnMsg: ['확인', '취소'],
            msg,
            title,
         });
         if (result) {
            if (videoEleRef.current) {
               Object.keys(videoEleRef.current).forEach((key) => {
                  videoEleRef.current[key].pause();
               });
            }
            if (state.info.mode == 'edit') {
               onClose();
               return;
            }
            dispatch({ type: 'CLEAR_FILE_ITEM' });
            dispatch({ type: 'CLEAR_INFO' });
            if (flowNumber == 1) {
               document.getElementById('leftSlideBtn')?.parentElement?.click();
            }
         }
      }
   };

   const validateInfo = useCallback((): { isOk: boolean; msg: string } => {
      let result = { isOk: true, msg: '' };
      const { tag, date } = state.info;
      if (!date) {
         result.msg = '날짜정보를 입력해주세요';
         result.isOk = false;
      } else if (tag.length <= 0) {
         result.msg = '태그정보를 입력해주세요';
         result.isOk = false;
      }
      return result;
   }, [state.info]);

   return (
      <UploadModalContext.Provider value={{ dispatch, state }}>
         <div
            id="uploadModal"
            className="top-0 left-0 fixed w-full h-full flex items-center justify-center"
         >
            <div
               onClick={exitEvt}
               id="uploadPannel"
               className="absolute top-0 left-0 w-full h-full bg-panel"
            />
            <div
               id="modalContainer"
               className="h-[640px] w-[640px]  relative dark:bg-gray-700 shadow-md bg-gray-50 rounded-md"
            >
               <div className="text-2xl font-bold absolute w-full text-center z-[2] top-5 pointer-events-none ">
                  {title}
               </div>
               <Carousel
                  onSlideChange={(number) => {
                     setFlowNumber(number);
                  }}
                  indicators={false}
                  theme={carouselTheme}
                  slide={false}
                  draggable={false}
                  rightControl={
                     flowNumber == 1 ? (
                        <CheckIcon
                           onClick={async (e) => {
                              e.stopPropagation();
                              savePost();
                           }}
                           className={`${slideBtnStyle} right-3 ${
                              flowNumber >= 2 ? 'hidden' : ''
                           }`}
                        />
                     ) : (
                        <ArrowRightIcon
                           id="rightArrow"
                           className={`${slideBtnStyle} right-3 ${
                              flowNumber == 0 && state.fileItem.length <= 0
                                 ? 'hidden'
                                 : ''
                           } ${flowNumber >= 2 ? 'hidden' : ''}`}
                        />
                     )
                  }
                  leftControl={
                     <ArrowLeftIcon
                        id="leftSlideBtn"
                        onClick={(event) => {
                           if (flowNumber == 0) {
                              exitEvt();
                              event.stopPropagation();
                           }
                        }}
                        className={`${slideBtnStyle} ${
                           flowNumber >= 2 ? 'hidden' : ''
                        }`}
                     />
                  }
               >
                  <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-20">
                     <FirstPage
                        flowNumber={flowNumber}
                        videoEleRef={videoEleRef}
                     />
                  </div>
                  <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-20">
                     <SecondPage />
                  </div>
                  <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-20">
                     <div className="flex items-center justify-center flex-col w-full h-full gap-4">
                        <CheckIcon className="w-12 h-12 rounded-full border-2 animate-bounce"></CheckIcon>
                        <div className="font-semibold text-2xl">
                           {state.info.mode == 'create'
                              ? '업로드가 완료되었습니다.'
                              : '수정이 완료되었습니다.'}
                        </div>
                     </div>
                  </div>
               </Carousel>
            </div>
         </div>
      </UploadModalContext.Provider>
   );
};

export const useUploadModal = () => {
   const context = useContext(UploadModalContext);
   if (!context)
      throw new Error('useUploadModal must be used within UploadModalProvider');
   return context;
};

export default UploadModal;
