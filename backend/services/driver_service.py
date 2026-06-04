class DriverService:

    def discover_drivers(self, session):

        drivers = {}

        for drv in session.drivers:

            info = session.get_driver(drv)

            drivers[str(drv)] = {
                "number": int(info["DriverNumber"]),
                "code": info["Abbreviation"],
                "name": info["FullName"],
                "team": info["TeamName"]
            }

        return drivers