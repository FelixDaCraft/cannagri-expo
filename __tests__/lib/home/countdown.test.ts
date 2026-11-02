import { getTimeLeft } from '@/lib/home/countdown'

const start = '2027-04-03T08:00:00.000Z'

describe('getTimeLeft', () => {
  it('décompose l’écart en jours, heures, minutes et secondes', () => {
    const now = new Date('2027-04-01T06:58:30.000Z')
    expect(getTimeLeft(start, now)).toEqual({ days: 2, hours: 1, minutes: 1, seconds: 30, isOver: false })
  })

  it('s’arrête à zéro une fois le salon commencé', () => {
    expect(getTimeLeft(start, new Date('2027-04-03T09:00:00.000Z'))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isOver: true,
    })
  })

  it('renvoie null sans date d’édition', () => {
    expect(getTimeLeft(null, new Date())).toBeNull()
  })
})
