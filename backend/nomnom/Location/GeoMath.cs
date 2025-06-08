namespace nomnom.Location;

internal static class GeoMath
{
    public static double DistanceBetweenCoords((double lon, double lat) p1,
                                               (double lon, double lat) p2)
    {
        const double R = 6_371_000;

        double a1 = DegToRad(p1.lat);
        double b1 = DegToRad(p1.lon);
        double a2 = DegToRad(p2.lat);
        double b2 = DegToRad(p2.lon);

        double d1 = a2 - a1;
        double d2 = b2 - b1;

        double a = Math.Sin(d1 / 2) * Math.Sin(d1 / 2) +
                   Math.Cos(a1) * Math.Cos(a2) *
                   Math.Sin(d2 / 2) * Math.Sin(d2 / 2);

        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return R * c;
    }

    private static double DegToRad(double deg) => deg * Math.PI / 180.0;
}
