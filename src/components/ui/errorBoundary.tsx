import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: React.ElementType;
  onReset: () => void;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
interface FallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    // 오류여부와 오류를 state 상태로 저장.
    this.state = {
      hasError: false,
      error: null,
    };

    // 이벤트 핸들러에서 호출할 함수 바인딩 처리.
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  // 오류 발생시
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 오류 상태 업데이트.
    return {
      hasError: true,
      error,
    };
  }

  // 오류 발생 후
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 콘솔에 에러 정보 출력
    console.log({ error, errorInfo });
  }

  resetErrorBoundary(): void {
    // 오류난 함수를 재요청.
    const { onReset } = this.props;
    onReset();
    // 에러 상태를 기본으로 초기화.
    this.setState({
      hasError: false,
      error: null,
    });
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    // fallback 컴포넌트 측에서 오류 정보를 props로 받을 수 있도록 설정
    const fallbackProps: FallbackProps = {
      error,
      resetErrorBoundary: this.resetErrorBoundary,
    };

    // 에러일 경우 fallback 컴포넌트 리턴
    if (hasError) {
      return React.createElement(fallback, { fallbackProps });
    }
    return children;
  }
}

export default ErrorBoundary;
