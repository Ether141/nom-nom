using BlinkDatabase.Annotations;

namespace nomnom.Models;

[Enum("order_status")]
internal enum OrderStatus
{
    [EnumValue("waiting_for_accept")]
    WaitingForAccept,

    [EnumValue("in_progress")]
    InProgress,

    [EnumValue("done")]
    Done
}
