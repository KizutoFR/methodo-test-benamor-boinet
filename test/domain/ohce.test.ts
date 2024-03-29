import * as os from "os";
import {Expressions} from "../../src/domain/expressions";
import {LangueFrançaise} from "../../src/domain/langue.francais";
import {VérificateurPalindromeBuilder} from "./utils/validate.palindrome.builder";
import {LangueAnglaise} from "../../src/domain/langue.anglais";
import {LangueInterface} from "../../src/domain/langue.interface";
import { MomentDeLaJournee } from "../../src/domain/moments";
import { LangueFake } from "./utils/langue.fake";

const palindrome = 'radar';
const nonPalindromes = ['test', 'ynov']
const moments = [
    MomentDeLaJournee.Nuit,
    MomentDeLaJournee.Inconnu,
    MomentDeLaJournee.Soir,
    MomentDeLaJournee.ApresMidi,
    MomentDeLaJournee.Matin,
];

describe("ohce.test.ts", () => {
    test.each([...nonPalindromes])(
        "QUAND on saisit un non-palindrome %s " +
        "ALORS elle est renvoyée en miroir",
        (chaîne: string) => {
            let résultat = VérificateurPalindromeBuilder.Default()
                .Vérifier(chaîne);

            let attendu = chaîne.split('').reverse().join('');
            expect(résultat).toContain(attendu);
        });

    test.each([
        [new LangueFrançaise(), Expressions.BIEN_DIT],
        [new LangueAnglaise(), Expressions.WELL_SAID],
    ])("ETANT DONNE un utilisateur parlant la %s " +
        "QUAND on saisit un palindrome " +
        "ALORS celui-ci est renvoyé " +
        "ET '%s' est envoyé ensuite",
        (langue: LangueInterface, attendu: string) => {
            let vérificateur = new VérificateurPalindromeBuilder()
                .AyantPourLangue(langue)
                .Build();

            let résultat = vérificateur.Vérifier(palindrome);

            expect(résultat).toContain(palindrome + os.EOL + attendu);
        });

    const generateAquittanceAndSalutionCases = () => {
        const inputs = [...nonPalindromes, palindrome];
        const cases: [MomentDeLaJournee, string][] = [];

        for (const moment of moments) {
            for (let chaîne of inputs) {
                cases.push([moment, chaîne])
            }
        }
                
        return cases;
    }

    test.each(generateAquittanceAndSalutionCases())(
        'ETANT DONNE un utilisateur parlant une langue ' +
        'ET que nous sommes le %s ' +
        'QUAND on saisit une chaîne %s ' +
        'ALORS les salutations de cette langue à ce moment de la journée sont envoyées avant toute réponse',
        (MomentDeLaJournee: MomentDeLaJournee, chaîne: string) => {
            let langueFake = new LangueFake();

            let vérificateur =
                new VérificateurPalindromeBuilder()
                    .AyantPourLangue(langueFake)
                    .AyantPourMomentDeLaJournée(MomentDeLaJournee)
                    .Build();

            let résultat = vérificateur.Vérifier(chaîne);

            let premièreLigne = résultat.split(os.EOL)[0];
            let attendu = langueFake.Saluer(MomentDeLaJournee);
            expect(premièreLigne).toEqual(attendu)
        });
    
    test.each(generateAquittanceAndSalutionCases())(
        'ETANT DONNE un utilisateur parlant une langue ' +
        'ET que nous sommes le %s ' +
        'QUAND on saisit une chaîne %s ' +
        'ALORS les aquittances de cette langue à ce moment de la journée sont envoyées après la réponse',
        (MomentDeLaJournee: MomentDeLaJournee, chaîne: string) => {
            const langueFake = new LangueFake();

            const vérificateur =
                new VérificateurPalindromeBuilder()
                    .AyantPourLangue(langueFake)
                    .AyantPourMomentDeLaJournée(MomentDeLaJournee)
                    .Build();

            const résultat = vérificateur.Vérifier(chaîne);

            const lignes = résultat.split(os.EOL);
            const dernièreLigne = lignes[lignes.length - 1];
            const attendu = langueFake.Acquitter(MomentDeLaJournee);
            expect(dernièreLigne).toEqual(attendu)
        });

    test.each([...nonPalindromes, palindrome])(
        'ETANT DONNE un utilisateur parlant français ' +
        'QUAND on saisit une chaîne %s ' +
        'ALORS "Au revoir" est envoyé en dernier.',
        (chaîne: string) => {
            const langue = new LangueFrançaise();
            let vérificateur =
                new VérificateurPalindromeBuilder()
                    .AyantPourLangue(langue)
                    .Build();

            let résultat = vérificateur.Vérifier(chaîne);

            let lignes = résultat.split(os.EOL);
            let dernièreLigne = lignes[lignes.length - 1];
            expect(dernièreLigne).toEqual(Expressions.AU_REVOIR)
        });

    test.each([...nonPalindromes, palindrome])(
        'ETANT DONNE un utilisateur parlant anglais ' +
        'QUAND on saisit une chaîne %s ' +
        'ALORS "Goodbye" est envoyé en dernier.',
        (chaîne: string) => {
            const langue = new LangueAnglaise();
            let vérificateur =
                new VérificateurPalindromeBuilder()
                    .AyantPourLangue(langue)
                    .Build();

            let résultat = vérificateur.Vérifier(chaîne);

            let lignes = résultat.split(os.EOL);
            let dernièreLigne = lignes[lignes.length - 1];
            expect(dernièreLigne).toEqual(Expressions.GOODBYE)
        });
});