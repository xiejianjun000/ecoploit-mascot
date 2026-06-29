import { useEffect, useRef, useCallback } from 'react';
import useMascotStore from '../store/mascotStore';

/**
 * WebSocket 监听 Hook
 * 连接 Hermes Agent 后端，驱动小E状态变化
 *
 * 实际部署时替换 URL 为真实 WebSocket 地址
 */
export default function useWebSocket(url = null) {
  const wsRef = useRef(null);
  const handleAgentEvent = useMascotStore((s) => s.handleAgentEvent);
  const setWsConnected = useMascotStore((s) => s.setWsConnected);

  const connect = useCallback(() => {
    // 如果未提供URL，使用模拟模式
    if (!url) {
      console.log('[WS] 模拟模式：未连接真实WebSocket');
      setWsConnected(true); // 标记为就绪，允许Demo面板控制
      return () => {};
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] 已连接到 Hermes Agent');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          handleAgentEvent(payload);
        } catch (e) {
          console.warn('[WS] 消息解析失败:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('[WS] 连接错误:', err);
      };

      ws.onclose = () => {
        console.log('[WS] 连接已关闭');
        setWsConnected(false);
        // 5秒后自动重连
        setTimeout(() => connect(), 5000);
      };

      return () => {
        ws.close();
        wsRef.current = null;
      };
    } catch (e) {
      console.error('[WS] 创建连接失败:', e);
      return () => {};
    }
  }, [url, handleAgentEvent, setWsConnected]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      if (cleanup) cleanup();
    };
  }, [connect]);

  /**
   * 模拟发送事件（用于Demo）
   */
  const simulateEvent = useCallback(
    (type, data = {}) => {
      handleAgentEvent({ type, data });
    },
    [handleAgentEvent]
  );

  return { simulateEvent };
}
