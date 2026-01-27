"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Users, AlertCircle, CheckCircle } from "lucide-react";

interface RessursOversiktProps {
  ungdomstrinnElever: number;
  barnetrinnElever: number;
  radgivere: any[];
  totalRadgiverProsent: number;
  settings: any;
}

// Konstanter fra SFS 2213
const ARSRAMME_45MIN = 741; // Standard årsramme barnetrinnet/ungdomstrinnet
const KONTAKTLARER_TIMER_45MIN = 38; // Minimum per kontaktlærer
const RADGIVER_TIMER_PER_25_ELEVER_45MIN = 38; // Per påbegynt 25 elever
const RADGIVER_PROSENT_ARSVERK = 5; // + 5% årsverk
const TIDSRESSURS_GRUPPE_45MIN = 76; // Per gruppe (maks 30 elever)
const TIDSRESSURSPOTT_PER_ELEV_45MIN = 2.67; // 2⅔ timer per elev

export function RessursOversikt({ 
  ungdomstrinnElever, 
  barnetrinnElever,
  radgivere,
  totalRadgiverProsent,
  settings
}: RessursOversiktProps) {
  const totalElever = ungdomstrinnElever + barnetrinnElever;

  // ===== BEREGNINGER FOR UNGDOMSTRINNET =====

  // 7.2.a) Tidsressurs per gruppe (maks 30 elever)
  const antallGrupper = Math.ceil(ungdomstrinnElever / 30);
  const tidsressursGrupperTimer = antallGrupper * TIDSRESSURS_GRUPPE_45MIN;
  const tidsressursGrupperProsent = (tidsressursGrupperTimer / ARSRAMME_45MIN) * 100;

  // 7.2.b) Tidsressurspott (byrdefull undervisning)
  const tidsressurspottTimer = totalElever * TIDSRESSURSPOTT_PER_ELEV_45MIN;
  const tidsressurspottProsent = (tidsressurspottTimer / ARSRAMME_45MIN) * 100;

  // 7.2.c) Kontaktlærer (beregnes per klasse, ikke her)
  const kontaktlarerTimerPrLarer = KONTAKTLARER_TIMER_45MIN;
  const kontaktlarerProsentPrLarer = (kontaktlarerTimerPrLarer / ARSRAMME_45MIN) * 100;

  // 7.2.d) Sosiallærer/rådgiver ungdomstrinnet
  const pabegynt25 = Math.ceil(ungdomstrinnElever / 25);
  const radgiverTimerFraElever = pabegynt25 * RADGIVER_TIMER_PER_25_ELEVER_45MIN;
  const radgiverProsentFraElever = (radgiverTimerFraElever / ARSRAMME_45MIN) * 100;
  const radgiverProsentTotal = radgiverProsentFraElever + RADGIVER_PROSENT_ARSVERK;
  const radgiverTimerTotal = radgiverTimerFraElever + (ARSRAMME_45MIN * RADGIVER_PROSENT_ARSVERK / 100);

  // Sjekk om rådgiverressurs er dekket
  const radgiverDekket = totalRadgiverProsent >= radgiverProsentTotal;
  const radgiverMangler = Math.max(0, radgiverProsentTotal - totalRadgiverProsent);

  return (
    <div className="space-y-6">
      {/* Sammendrag */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totalt elevtall</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElever}</div>
            <p className="text-xs text-muted-foreground">
              {ungdomstrinnElever} ungdomstrinn, {barnetrinnElever} barnetrinn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rådgiverressurs krav</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{radgiverProsentTotal.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {radgiverTimerTotal.toFixed(0)} årsrammetimer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rådgiver tildelt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRadgiverProsent.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {radgivere.length} rådgiver(e)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            {radgiverDekket ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Dekket</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Mangler {radgiverMangler.toFixed(1)}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detaljert beregning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Detaljert ressursberegning (SFS 2213)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 7.2.d Rådgiver */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">7.2.d) Sosiallærer/rådgiver ungdomstrinnet</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Antall elever ungdomstrinnet:</span>
                  <span className="font-medium">{ungdomstrinnElever}</span>
                </div>
                <div className="flex justify-between">
                  <span>Påbegynt 25 elever ({ungdomstrinnElever} / 25):</span>
                  <span className="font-medium">{pabegynt25}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timer: {pabegynt25} × 38 årsrammetimer:</span>
                  <span className="font-medium">{radgiverTimerFraElever} timer</span>
                </div>
                <div className="flex justify-between">
                  <span>Prosent fra timer ({radgiverTimerFraElever} / {ARSRAMME_45MIN}):</span>
                  <span className="font-medium">{radgiverProsentFraElever.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>+ 5% årsverk:</span>
                  <span className="font-medium">5.00%</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-300 font-medium text-blue-900">
                  <span>Total rådgiverressurs:</span>
                  <span>{radgiverProsentTotal.toFixed(2)}% ({radgiverTimerTotal.toFixed(0)} timer)</span>
                </div>
              </div>
            </div>

            {/* 7.2.c Kontaktlærer */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-3">7.2.c) Kontaktlærertjeneste</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Minimum per kontaktlærer:</span>
                  <span className="font-medium">{KONTAKTLARER_TIMER_45MIN} årsrammetimer</span>
                </div>
                <div className="flex justify-between">
                  <span>Tilsvarer i prosent:</span>
                  <span className="font-medium">{kontaktlarerProsentPrLarer.toFixed(2)}%</span>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Hver kontaktlærer skal ha minimum {kontaktlarerProsentPrLarer.toFixed(1)}% reduksjon i undervisningstid.
                </p>
              </div>
            </div>

            {/* 7.2.a Tidsressurs grupper */}
            {ungdomstrinnElever > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-3">7.2.a) Tidsressurs ungdomstrinnet</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Antall grupper (maks 30 elever):</span>
                    <span className="font-medium">{antallGrupper}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timer: {antallGrupper} × 76 årsrammetimer:</span>
                    <span className="font-medium">{tidsressursGrupperTimer} timer</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tilsvarer i prosent:</span>
                    <span className="font-medium">{tidsressursGrupperProsent.toFixed(2)}%</span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    Brukes til sosialpedagogisk tjeneste, kontaktlærer elevråd, lokale funksjoner.
                  </p>
                </div>
              </div>
            )}

            {/* 7.2.b Tidsressurspott */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-3">7.2.b) Tidsressurspott</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Totalt elevtall:</span>
                  <span className="font-medium">{totalElever}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timer: {totalElever} × 2⅔ årsrammetimer:</span>
                  <span className="font-medium">{tidsressurspottTimer.toFixed(0)} timer</span>
                </div>
                <div className="flex justify-between">
                  <span>Tilsvarer i prosent:</span>
                  <span className="font-medium">{tidsressurspottProsent.toFixed(2)}%</span>
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  Til lærere/skoleledere med byrdefull undervisningssituasjon. Fordeling drøftes lokalt.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tildelte rådgivere */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tildelte rådgivere
          </CardTitle>
        </CardHeader>
        <CardContent>
          {radgivere.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ingen rådgivere er tildelt ennå. Gå til "Lærere" og legg til rådgiver-funksjon.
            </p>
          ) : (
            <div className="space-y-2">
              {radgivere.map((teacher: any) => {
                const advisorFunctions = teacher.teacher_functions?.filter(
                  (f: any) => f.function_type === 'advisor'
                ) || [];
                const totalPct = advisorFunctions.reduce(
                  (sum: number, f: any) => sum + (f.percent_of_position || 0), 0
                );
                return (
                  <div key={teacher.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <div>
                      <span className="font-medium">{teacher.name}</span>
                      <Badge variant="secondary" className="ml-2">Rådgiver</Badge>
                    </div>
                    <span className="font-medium">{totalPct.toFixed(1)}%</span>
                  </div>
                );
              })}
              <div className="pt-2 border-t mt-3">
                <div className="flex justify-between font-medium">
                  <span>Totalt tildelt:</span>
                  <span className={totalRadgiverProsent >= radgiverProsentTotal ? 'text-green-600' : 'text-red-600'}>
                    {totalRadgiverProsent.toFixed(1)}% av {radgiverProsentTotal.toFixed(1)}% krav
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
