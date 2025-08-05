interface AlertModalProps {
  title?: string;
  msg: string;
  btnMsg: string[];
  onClose: (result?: any) => void;
}

const AlertModal = ({ btnMsg, msg, onClose, title }: AlertModalProps) => {
  return (
    <div
      id="alertModal"
      className="overflow-y-auto overflow-x-hidden fixed flex
      top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-full"
    >
      <div className="z-[1] relative p-4 w-full max-w-md max-h-full justify-center items-center bottom-32">
        <div className="relative bg-white rounded-lg shadow-md dark:bg-gray-700">
          <div className="p-4 md:p-5 text-center flex gap-4 flex-col">
            {title && <h3 className="text-xl  font-bold">{title}</h3>}
            <div className="text-base">{msg}</div>
            <div>
              <button
                onClick={() => onClose(1)}
                type="button"
                className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
              >
                {btnMsg[0]}
              </button>
              <button
                onClick={() => onClose(0)}
                data-modal-hide="popup-modal"
                type="button"
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                {btnMsg[1]}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        id="alertPannel"
        className="absolute top-0 w-full h-full bg-[rgba(0,0,0,0.5)] "
      />
    </div>
  );
};

export default AlertModal;
