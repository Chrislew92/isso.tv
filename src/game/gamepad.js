export function readGamepad(gamepad, deadzone = 0.16) {
  const axis = (index, invert = false) => {
    const value = Number(gamepad?.axes?.[index] ?? 0)
    if (!Number.isFinite(value) || Math.abs(value) <= deadzone) return 0
    return invert ? -value : value
  }
  const pressed = (index) => Boolean(gamepad?.buttons?.[index]?.pressed)
  return {
    x: axis(0),
    y: axis(1, true),
    interact: pressed(0),
    sprint: pressed(1),
    quiet: pressed(2),
    memory: pressed(3),
    buttons: gamepad?.buttons?.map((button) => Boolean(button.pressed)) ?? [],
  }
}
