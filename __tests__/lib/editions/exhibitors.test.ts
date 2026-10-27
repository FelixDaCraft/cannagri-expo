import { toExhibitors, type ExhibitorStand } from '@/lib/editions/exhibitors'

const baseStand: ExhibitorStand = {
  id: 's1',
  number: 12,
  proId: null,
  exhibitorName: null,
  exhibitorDescription: null,
  exhibitorLogo: null,
  exhibitorWebsite: null,
  exhibitorCategory: null,
  pro: null,
  sponsor: null,
}

describe('toExhibitors', () => {
  it("présente le compte pro validé d'un stand", () => {
    const [exhibitor] = toExhibitors([
      {
        ...baseStand,
        proId: 'u1',
        pro: {
          id: 'u1', companyName: 'Chanvre & Co', companyDescription: 'Producteur', companyDescriptionTranslations: null,
          companyLogo: '/l.png', companyWebsite: 'https://chanvre.example', businessType: 'PRODUCTEURS', isApproved: true,
        },
      },
    ])
    expect(exhibitor).toMatchObject({
      id: 'u1', name: 'Chanvre & Co', standNumber: '12', category: 'PRODUCTEURS', categoryLabel: 'Producteurs CBD',
      logoUrl: '/l.png', websiteUrl: 'https://chanvre.example',
    })
  })

  it("ignore un compte pro non validé", () => {
    expect(
      toExhibitors([{ ...baseStand, proId: 'u1', pro: { id: 'u1', companyName: 'X', companyDescription: null,
        companyDescriptionTranslations: null, companyLogo: null, companyWebsite: null, businessType: null, isApproved: false } }])
    ).toEqual([])
  })

  it("présente un sponsor qui tient un stand", () => {
    const [exhibitor] = toExhibitors([
      {
        ...baseStand,
        sponsor: {
          id: 'sp1', name: 'Sponsor Or', exhibitorDescription: null, exhibitorDescriptionTranslations: null,
          logoUrl: null, websiteUrl: null, exhibitorCategory: 'MATERIEL', isActive: true,
        },
      },
    ])
    expect(exhibitor).toMatchObject({ id: 'sp1', name: 'Sponsor Or', category: 'MATERIEL', categoryLabel: 'Matériel de Culture' })
  })

  it("présente un exposant saisi directement par l'admin", () => {
    const [exhibitor] = toExhibitors([{ ...baseStand, exhibitorName: 'Stand direct', exhibitorCategory: 'LIFESTYLE' }])
    expect(exhibitor).toMatchObject({ id: 's1', name: 'Stand direct', categoryLabel: 'Lifestyle & Food' })
  })

  it("ignore un stand sans exposant", () => {
    expect(toExhibitors([baseStand])).toEqual([])
  })
})
