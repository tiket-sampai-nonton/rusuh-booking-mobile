import { Fragment } from "react";

import { Seo } from "@presentation/components/Seo";
import { MyTicketsScreen } from "@presentation/screens/MyTickets";

export default function MyTicketsRoute() {
  return (
    <Fragment>
      <Seo
        title="My Tickets"
        description="Manage your Rusuh Tiket e-tickets."
        path="/my-tickets"
        noindex
      />
      <MyTicketsScreen />
    </Fragment>
  );
}
