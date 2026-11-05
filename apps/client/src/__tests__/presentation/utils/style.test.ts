import { hardShadowStyle, nativeDriverSupported, pointerEventsBoxNone, pointerEventsNone } from '../../../presentation/utils/style';

describe('presentation style utilities', () => {
  it('uses CSS hard shadows on web', () => {
    expect(hardShadowStyle(4, 3, '#000', 5, 'web')).toEqual({ boxShadow: '4px 3px 0 #000' });
  });

  it('uses native hard shadows outside web', () => {
    expect(hardShadowStyle(4, 3, '#000', 5, 'android')).toEqual({
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 5,
    });
  });

  it('selects the compatible animation driver', () => {
    expect(nativeDriverSupported('web')).toBe(false);
    expect(nativeDriverSupported('ios')).toBe(true);
  });

  it('provides reusable pointer event styles', () => {
    expect(pointerEventsNone.pointerEvents).toBe('none');
    expect(pointerEventsBoxNone.pointerEvents).toBe('box-none');
  });
});
