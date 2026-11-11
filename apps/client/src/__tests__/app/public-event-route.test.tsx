import { render } from "@testing-library/react-native";

const mockParams: { eventId?: string; source?: string } = {};
const mockEventDetailScreen = jest.fn(
  (_props: { eventId: string; hideQueueCta?: boolean }) => null,
);

jest.mock("expo-router", () => ({ useLocalSearchParams: () => mockParams }));
jest.mock("@presentation/components/Seo", () => ({
  Seo: () => null,
  eventJsonLd: jest.fn(() => ({})),
}));
jest.mock("@presentation/screens/EventDetail", () => ({
  EventDetailScreen: (props: { eventId: string }) =>
    mockEventDetailScreen(props),
}));

// eslint-disable-next-line import/first
import EventDetailRoute from "../../app/(public)/events/[eventId]";

describe("public event route param fallback", () => {
  beforeEach(() => {
    mockParams.eventId = undefined;
    mockParams.source = undefined;
    mockEventDetailScreen.mockClear();
  });

  it("passes an empty route identifier when eventId is absent", () => {
    render(<EventDetailRoute />);
    expect(mockEventDetailScreen).toHaveBeenCalledWith({
      eventId: "",
      hideQueueCta: false,
    });
  });

  it("passes the provided event identifier through", () => {
    mockParams.eventId = "evt-123";
    render(<EventDetailRoute />);
    expect(mockEventDetailScreen).toHaveBeenCalledWith({
      eventId: "evt-123",
      hideQueueCta: false,
    });
  });

  it("hides the queue CTA for history-origin details", () => {
    mockParams.eventId = "evt-history";
    mockParams.source = "history";
    render(<EventDetailRoute />);
    expect(mockEventDetailScreen).toHaveBeenCalledWith({
      eventId: "evt-history",
      hideQueueCta: true,
    });
  });
});
