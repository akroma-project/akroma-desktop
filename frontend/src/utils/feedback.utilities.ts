import { ElNotification } from "element-plus";

const displaySuccess = (message: string): void => {
  ElNotification({
    message: message,
    type: 'success',
    position: 'bottom-right',
  });
}

const displayError = (message: string): void => {
  ElNotification({
    message: message,
    type: 'error',
    position: 'bottom-right',
  });
}

export { displaySuccess, displayError };
